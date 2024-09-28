import { useState, useRef, useEffect } from 'react';
import MobileLayout from "../../layouts/mobileLayout";

const StepTwoSelesai = ({ handleNextStepData }) => {
  const videoRef = useRef(null);

  const [jamSelesai, setJamSelesai] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [fotoSelesai, setFotoSelesai] = useState(null);
  const [fotoDiambil, setFotoDiambil] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isSelesaiSelected, setIsSelesaiSelected] = useState(false);
  const [koordinatSelesai, setKoordinatSelesai] = useState({ latitude: null, longitude: null });

  const isFormValid = () => {
    return jamSelesai && koordinatSelesai.latitude && fotoSelesai;
  };

  const handleSelesai = () => {
    if (!fotoDiambil) { const now = new Date(); setJamSelesai(now); setCurrentTime(now); getLocation(); capturePhoto(); setIsSelesaiSelected(true); setFotoDiambil(true); stopVideoStream()}
  };

  const handleUlangi = async () => {
    startVideo(); setJamSelesai(null); setFotoSelesai(null); setCurrentTime(null); setFotoDiambil(false); setIsCameraReady(false); setIsSelesaiSelected(false); setKoordinatSelesai({ latitude: null, longitude: null })
  };

  const stopVideoStream = () => {
    const tracks = videoRef.current?.srcObject?.getTracks();
    tracks?.forEach(track => track.stop());
    videoRef.current.srcObject = null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedJamSelesai = jamSelesai;
    const tanggalSelesai = formattedJamSelesai?.toLocaleDateString('en-GB');
    const jamSelesaiFormatted = formattedJamSelesai?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const submissionData = {fotoSelesai, tanggalSelesai, jamSelesai: jamSelesaiFormatted, koordinatSelesai: `${koordinatSelesai.latitude}, ${koordinatSelesai.longitude}`};
    handleNextStepData(submissionData);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords; 
        setKoordinatSelesai({ latitude, longitude })
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const startVideo = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {videoRef.current.play(); setIsCameraReady(true)};
      } catch (error) {
      }
    }
  };

  const resizeImage = (blob) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 720;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) {height *= MAX_WIDTH / width; width = MAX_WIDTH}
        } else {
          if (height > MAX_HEIGHT) {width *= MAX_HEIGHT / height; height = MAX_HEIGHT}
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((newBlob) => resolve(newBlob), 'image/png', 0.7);
      };
    });
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const aspectRatio = 3 / 4;
    const canvas = document.createElement('canvas');
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
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, (videoWidth - canvasWidth) / 2, (videoHeight - canvasHeight) / 2, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
    canvas.toBlob(async (blob) => {
      const fileSize = blob.size / (1024 * 1024);
      if (fileSize > 5) {
        const compressedBlob = await resizeImage(blob);
        setFotoSelesai(URL.createObjectURL(compressedBlob));
      } else {
        setFotoSelesai(URL.createObjectURL(blob));
      }
    }, 'image/png');
  };

  useEffect(() => {
    if (fotoDiambil) {
      const interval = setInterval(() => {setCurrentTime(new Date())}, 1000);
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
    <MobileLayout title="ABSENSI SELESAI" className="p-6 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
      <div style={styles.container}>
        <form style={styles.form}>
          {!fotoDiambil ? (
            <>
              <video ref={videoRef} style={styles.video} />
              <div style={styles.buttonContainer}>
                <button onClick={handleSelesai} disabled={!isCameraReady} style={isCameraReady ? styles.buttonActive : styles.buttonInactive}>SELESAI</button>
              </div>
            </>
          ) : (
            <div style={styles.details}>
              <img src={fotoSelesai} alt="Foto Selesai" style={styles.photo} />
              <div style={styles.infoContainer}>
                <div style={styles.infoBox}>
                  <p style={styles.label}>Jam:</p>
                  <p>{currentTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</p>
                </div>
                <div style={styles.infoBox}>
                  <p style={styles.label}>Tanggal:</p>
                  <p>{jamSelesai?.toLocaleDateString('en-GB')}</p>
                </div>
                <div style={styles.infoBox}>
                  <p style={styles.label}>Koordinat:</p>
                  <p>{koordinatSelesai.latitude}, {koordinatSelesai.longitude}</p>
                </div>
              </div>
              <button onClick={handleUlangi} style={{ ...styles.buttonUlangi, color: '#000' }}>↻</button>
              <button type="submit" onClick={handleSubmit} disabled={!isFormValid()} style={isFormValid() ? styles.buttonActive : styles.buttonInactive}>➜</button>
            </div>
          )}
        </form>
      </div>
    </MobileLayout>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
  },
  form: {
    width: '100%',
    padding: '20px',
    maxWidth: '600px',
    border: '2px solid',
    borderRadius: '10px',
    backgroundColor: '#f9f9f9',
  },
  video: {
    width: '100%',
    objectFit: 'cover',
    aspectRatio: '3 / 4',
    borderRadius: '10px',
  },
  buttonContainer: {
    display: 'flex',
    marginTop: '10px',
    justifyContent: 'center',
  },
  buttonActive: {
    width: '100%',
    padding: '10px',
    cursor: 'pointer',
    marginTop: '10px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    border: '2px solid',
    borderRadius: '10px',
    backgroundColor: '#28a745',
  },
  details: {
    textAlign: 'center',
  },
  photo: {
    width: '100%',
    borderRadius: '10px',
    marginBottom: '20px',
  },
  infoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  infoBox: {
    width: '100%',
    display: 'flex',
    padding: '10px',
    textAlign: 'left',
    borderRadius: '10px',
    marginBottom: '10px',
    backgroundColor: '#fff',
    border: '2px solid #ccc',
    justifyContent: 'space-between',
  },
  label: {
    fontWeight: 'bold',
  },
  buttonInactive: {
    width: '100%',
    padding: '10px',
    marginTop: '10px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    border: '2px solid',
    borderRadius: '10px',
    cursor: 'not-allowed',
    backgroundColor: '#b0b0b0',
  },
  buttonUlangi: {
    color: '#000',
    width: '100%',
    padding: '10px',
    cursor: 'pointer',
    marginTop: '10px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    border: '2px solid',
    borderRadius: '10px',
    backgroundColor: '#f44336',
  },
};

export default StepTwoSelesai;
