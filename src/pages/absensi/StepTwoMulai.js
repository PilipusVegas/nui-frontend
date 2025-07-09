import { useState, useRef, useEffect } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import Swal from "sweetalert2";

const StepTwoMulai = ({ handleNextStepData }) => {
  const videoRef = useRef(null);
  const [jamMulai, setJamMulai] = useState(null);
  const [fotoMulai, setFotoMulai] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [fotoDiambil, setFotoDiambil] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isMulaiSelected, setIsMulaiSelected] = useState(false);
  const [koordinatMulai, setKoordinatMulai] = useState({ latitude: null, longitude: null });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [facingMode, setFacingMode] = useState("user"); 
  const [switching, setSwitching] = useState(false);

  const switchCamera = () => {
    stopVideoStream();
    setIsCameraReady(false);
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  useEffect(() => {
    setLoading(!(koordinatMulai?.latitude && koordinatMulai?.longitude));
  }, [koordinatMulai]);

  const isFormValid = () => {
    return jamMulai && koordinatMulai.latitude && fotoMulai;
  };

  const handleMulai = () => {
    if (!fotoDiambil) {
      const now = new Date();
      setJamMulai(now);
      setCurrentTime(now);
      setLoadingLocation(true);
      getLocation();
      setLoadingPhoto(true);
      capturePhoto();
      setIsMulaiSelected(true);
      setFotoDiambil(true);
      stopVideoStream();
    }
  };

  const handleUlangi = async () => {
    startVideo();
    setJamMulai(null);
    setFotoMulai(null);
    setCurrentTime(null);
    setFotoDiambil(false);
    setIsCameraReady(false);
    setIsMulaiSelected(false);
    setKoordinatMulai({ latitude: null, longitude: null });
    setLoadingLocation(false);
    setLoadingPhoto(false);
  };

  const stopVideoStream = () => {
    const video = videoRef.current;
    if (video?.srcObject) {
      const tracks = video.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      video.srcObject = null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid() || loadingLocation || loadingPhoto) {
      return;
    }
    const formattedJamMulai = jamMulai;
    const tanggalMulai = formattedJamMulai?.toLocaleDateString("en-GB");
    const jamMulaiFormatted = formattedJamMulai?.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const submissionData = {
      fotoMulai,
      tanggalMulai,
      jamMulai: jamMulaiFormatted,
      koordinatMulai: `${koordinatMulai.latitude}, ${koordinatMulai.longitude}`,
    };
    handleNextStepData(submissionData);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      setLoadingLocation(true);

      // Menggunakan getCurrentPosition untuk hanya mendapatkan satu kali lokasi
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setKoordinatMulai({ latitude, longitude });
          setLoadingLocation(false);
        },
        () => {
          alert("Gagal mendapatkan lokasi.");
          setLoadingLocation(false);
        },
        {
          enableHighAccuracy: false, 
          maximumAge: 0,
        }
      );
    } else {
      alert("Geolocation tidak didukung oleh browser ini.");
      setLoadingLocation(false);
    }
  };

  const startVideo = async (source = "init") => {
    try {
      const constraints = {
        video: {
          facingMode: facingMode === "user" ? "user" : { exact: "environment" },
        },
      };
  
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
  
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          requestAnimationFrame(() => {
            videoRef.current.play();
            setIsCameraReady(true);
          });
        };
      }
    } catch (error) {
      console.error("Gagal membuka kamera:", error);
      Swal.fire({
        title: source === "switch" ? "Gagal Membalikkan Kamera" : "Gagal Mengakses Kamera",
        text:
          source === "switch"
            ? "Kamera tidak tersedia atau akses ditolak. Mengembalikan ke mode sebelumnya."
            : "Pastikan izin kamera sudah diberikan, lalu coba lagi.",
        icon: "error",
        confirmButtonText: "Oke",
      });
  
      // Kalau dari switch, balikin mode kamera sebelumnya
      if (source === "switch") {
        setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
      }
    }
  };
  
  useEffect(() => {
    stopVideoStream();
    startVideo("switch");
  }, [facingMode]);
  
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      setTimeout(() => {
        setFotoMulai(URL.createObjectURL(blob));
        setLoadingPhoto(false);
      }, 500);
    }, "image/png");
  };

  useEffect(() => {
    if (fotoDiambil) {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 500);
      return () => clearInterval(interval);
    }
  }, [fotoDiambil]);

  useEffect(() => {
    startVideo("init");
    return () => {
      const tracks = videoRef.current?.srcObject?.getTracks();
      tracks?.forEach((track) => track.stop());
    };
  }, []);
  

  return (
    <MobileLayout title="Absen Masuk" className="p-6 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
      <div className="flex justify-center">
        <form className="w-full max-w-lg p-4 border-2 rounded-lg bg-white">
          {!fotoDiambil ? (
            <>
              <video ref={videoRef} className="w-full h-[72vh] object-cover rounded-md -scale-x-100" />
              <div className="flex gap-4 mt-4 w-full">
                <button type="button" onClick={switchCamera} className="w-full py-4 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600">
                {switching ? "Mengganti..." : "Balikkan Kamera"}
                </button>
                <button onClick={handleMulai} disabled={!isCameraReady} className={`w-full py-4 text-sm font-semibold text-white rounded-lg ${ isCameraReady ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"}`}>
                  Ambil Foto
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-full h-[55vh] flex justify-center items-center bg-gray-200 rounded-lg relative">
                {loadingPhoto ? (
                  <div className="animate-spin w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full"></div>
                ) : (
                  <img src={fotoMulai} alt="Foto Mulai" className="w-full h-full object-cover rounded-lg -scale-x-100"/>
                )}
              </div>
              <div className="px-3 py-2 border rounded-lg mt-4">
                <div className="flex justify-between py-2">
                  <p className="font-bold">Jam:</p>
                  <p> {currentTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,})}</p>
                </div>
                <hr className="border-gray-300 my-2" />
                <div className="flex justify-between py-2">
                  <p className="font-bold">Tanggal:</p>
                  <p>{jamMulai?.toLocaleDateString("en-GB")}</p>
                </div>
                <hr className="border-gray-300 my-2" />
                <div className="flex justify-between py-2">
                  <p className="font-bold">Lokasi:</p>
                  {loading ? (
                    <p className="animate-pulse text-gray-500">Mencari lokasi...</p>
                  ) : (
                    <p className="text-green-500 font-semibold">Berhasil melacak lokasi</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <button onClick={handleUlangi} className="flex-1 py-2 px-4 text-red-600 border border-red-600 font-bold rounded-lg hover:bg-red-100">
                  ↻ Ulangi
                </button>
                <button type="submit" onClick={handleSubmit} disabled={!isFormValid() || loadingLocation || loadingPhoto} className={`w-1/2 py-2 ml-2 font-semibold text-white border-2 rounded-lg ${
                    isFormValid() && !loadingLocation && !loadingPhoto
                      ? "bg-green-500"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {loadingLocation || loadingPhoto ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Loading...
                    </div>
                  ) : (
                    "Next ➜"
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </MobileLayout>
  );
};

export default StepTwoMulai;
