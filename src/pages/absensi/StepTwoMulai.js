import { useState, useRef, useEffect } from "react";
import MobileLayout from "../../layouts/mobileLayout";

const StepTwoMulai = ({ handleNextStepData }) => {
  const videoRef = useRef(null);

  const [jamMulai, setJamMulai] = useState(null);
  const [fotoMulai, setFotoMulai] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [fotoDiambil, setFotoDiambil] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isMulaiSelected, setIsMulaiSelected] = useState(false);
  const [koordinatMulai, setKoordinatMulai] = useState({ latitude: null, longitude: null });

  const isFormValid = () => {
    return jamMulai && koordinatMulai.latitude && fotoMulai;
  };

  const handleMulai = () => {
    if (!fotoDiambil) {
      const now = new Date();
      setJamMulai(now);
      setCurrentTime(now);
      getLocation();
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
  };

  const stopVideoStream = () => {
    const tracks = videoRef.current?.srcObject?.getTracks();
    tracks?.forEach((track) => track.stop());
    videoRef.current.srcObject = null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setKoordinatMulai({ latitude, longitude });
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const startVideo = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsCameraReady(true);
        };
      } catch (error) {
        console.error(error);
      }
    }
  };

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
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      const fileSize = blob.size / (1024 * 1024);
      if (fileSize > 5) {
        const compressedBlob = await resizeImage(blob);
        setFotoMulai(URL.createObjectURL(compressedBlob));
      } else {
        setFotoMulai(URL.createObjectURL(blob));
      }
    }, "image/png");
  };

  useEffect(() => {
    if (fotoDiambil) {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
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
    <MobileLayout title="ABSENSI MASUK" className="p-6 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
      <div className="flex justify-center">
        <form className="w-full max-w-lg p-6 border-2 rounded-lg bg-white">
          {!fotoDiambil ? (
            <>
              <video ref={videoRef} className="w-full h-[70vh] object-cover rounded-lg" />
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleMulai}
                  disabled={!isCameraReady}
                  className={`w-full py-2 font-semibold text-white uppercase border-2 rounded-lg ${
                    isCameraReady ? "bg-green-500" : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Ambil Foto
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <img src={fotoMulai} alt="Foto Mulai" className="w-full mb-6 rounded-lg" />
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between p-4 bg-gray-100 border rounded-lg">
                  <p className="font-bold">Jam:</p>
                  <p>
                    {currentTime?.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </p>
                </div>
                <div className="flex justify-between p-4 bg-gray-100 border rounded-lg">
                  <p className="font-bold">Tanggal:</p>
                  <p>{jamMulai?.toLocaleDateString("en-GB")}</p>
                </div>
                <div className="flex justify-between p-4 bg-gray-100 border rounded-lg">
                  <p className="font-bold">Koordinat:</p>
                  <p>
                    {koordinatMulai.latitude}, {koordinatMulai.longitude}
                  </p>
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <button onClick={handleUlangi} className="w-1/2 py-2 mr-2 text-black bg-red-500 border-2 rounded-lg">
                  ↻ Ulangi
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={!isFormValid()}
                  className={`w-1/2 py-2 ml-2 font-semibold text-white uppercase border-2 rounded-lg ${
                    isFormValid() ? "bg-green-500" : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  ➜ Submit
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
