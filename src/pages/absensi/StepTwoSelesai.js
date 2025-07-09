import { useState, useRef, useEffect } from "react";
import MobileLayout from "../../layouts/mobileLayout";

const StepTwoSelesai = ({ handleNextStepData }) => {
  const videoRef = useRef(null);
  const [jamSelesai, setJamSelesai] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(null);
  const [fotoSelesai, setFotoSelesai] = useState(null);
  const [fotoDiambil, setFotoDiambil] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isSelesaiSelected, setIsSelesaiSelected] = useState(false);
  const [koordinatSelesai, setKoordinatSelesai] = useState({latitude: null, longitude: null,});
  const isFormValid = () => jamSelesai && koordinatSelesai.latitude && fotoSelesai;
  const [facingMode, setFacingMode] = useState("user"); // default kamera depan

  const switchCamera = () => {
    const newFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacing);
  };
  

  useEffect(() => {
    setLoading(!(koordinatSelesai?.latitude && koordinatSelesai?.longitude));
  }, [koordinatSelesai]);

  const handleSelesai = () => {
    if (!fotoDiambil) {
      const now = new Date();
      setJamSelesai(now);
      setCurrentTime(now);
      getLocation();
      capturePhoto();
      setIsSelesaiSelected(true);
      setFotoDiambil(true);
      stopVideoStream();
    }
  };

  const handleUlangi = async () => {
    startVideo();
    setJamSelesai(null);
    setFotoSelesai(null);
    setCurrentTime(null);
    setFotoDiambil(false);
    setIsCameraReady(false);
    setIsSelesaiSelected(false);
    setKoordinatSelesai({ latitude: null, longitude: null });
  };

  const stopVideoStream = () => {
    const tracks = videoRef.current?.srcObject?.getTracks();
    tracks?.forEach((track) => track.stop());
    videoRef.current.srcObject = null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedJamSelesai = jamSelesai;
    const tanggalSelesai = formattedJamSelesai?.toLocaleDateString("en-GB");
    const jamSelesaiFormatted = formattedJamSelesai?.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const submissionData = {
      fotoSelesai,
      tanggalSelesai,
      jamSelesai: jamSelesaiFormatted,
      koordinatSelesai: `${koordinatSelesai.latitude}, ${koordinatSelesai.longitude}`,
    };
    handleNextStepData(submissionData);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setKoordinatSelesai({ latitude, longitude });
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const startVideo = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const constraints = {
          video: { facingMode: { ideal: facingMode } }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setIsCameraReady(true);
          };
        }
      } catch (error) {
        console.error("Gagal memulai kamera:", error);
        setIsCameraReady(false);
      }
    }
  };

  useEffect(() => {
    stopVideoStream();
    startVideo();
  }, [facingMode]);
  

  const resizeImage = (blob) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 720;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((newBlob) => resolve(newBlob), "image/png", 0.7);
      };
    });
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const aspectRatio = 3 / 4;
    const canvas = document.createElement("canvas");
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    let canvasWidth, canvasHeight;
    if (videoWidth / videoHeight > aspectRatio) {
      canvasHeight = videoHeight;
      canvasWidth = videoHeight * aspectRatio;
    } else {
      canvasWidth = videoWidth;
      canvasHeight = videoWidth / aspectRatio;
    }
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      video,
      (videoWidth - canvasWidth) / 2,
      (videoHeight - canvasHeight) / 2,
      canvasWidth,
      canvasHeight,
      0,
      0,
      canvasWidth,
      canvasHeight
    );
    canvas.toBlob(async (blob) => {
      const fileSize = blob.size / (1024 * 1024);
      if (fileSize > 5) {
        const compressedBlob = await resizeImage(blob);
        setFotoSelesai(URL.createObjectURL(compressedBlob));
      } else {
        setFotoSelesai(URL.createObjectURL(blob));
      }
    }, "image/png");
  };

  useEffect(() => {
    if (fotoDiambil) {
      const interval = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(interval);
    }
  }, [fotoDiambil]);

  useEffect(() => {
    startVideo();
    return () => {
      const tracks = videoRef.current?.srcObject?.getTracks();
      tracks?.forEach((track) => track.stop());
    };
  }, []);

  return (
    <MobileLayout title="Absen Selesai" className="p-6 bg-gray-100 rounded-lg shadow-sm">
      <div className="flex justify-center">
        <form className="w-full max-w-lg p-4 bg-white rounded-lg shadow">
          {!fotoDiambil ? (
            <>
              <video ref={videoRef} className="w-full h-[72vh] object-cover rounded-md -scale-x-100" />
              <div className="flex gap-4 mt-4 w-full">
                <button type="button" onClick={switchCamera} className="w-full py-4 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600">
                  Balikkan Kamera
                </button>

                <button onClick={handleSelesai} disabled={!isCameraReady} className={`w-full py-4 text-sm font-semibold text-white rounded-lg ${ isCameraReady ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"}`}>
                  Ambil Foto
                </button>
              </div>

            </>
          ) : (
            <>
              <img src={fotoSelesai} alt="Foto Selesai" className="w-full max-h-[70vh] rounded-md mb-4 -scale-x-100" />
              <div className="p-4 rounded-md border space-y-2">
                <div className="flex justify-between">
                  <p className="font-bold">Jam:</p>
                  <p> {currentTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false})}</p>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between">
                  <p className="font-bold">Tanggal:</p>
                  <p>{jamSelesai?.toLocaleDateString("en-GB")}</p>
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

              <div className="flex flex-row items-center gap-x-4 w-full mt-4">
                <button onClick={handleUlangi} className="flex-1 py-2 px-4 text-red-600 border border-red-600 font-bold rounded-lg hover:bg-red-100">
                  ↻ Ulangi
                </button>

                <button type="submit" onClick={handleSubmit} disabled={!isFormValid()} className={`flex-1 py-2 px-4 text-white font-bold rounded-lg ${ isFormValid() ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed" }`}>
                  Next ➜
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </MobileLayout>
  );
};

export default StepTwoSelesai;
