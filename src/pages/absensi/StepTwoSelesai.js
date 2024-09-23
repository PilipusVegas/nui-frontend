import { useState, useRef, useEffect } from 'react';
import MobileLayout from "../../layouts/mobileLayout";

const StepSelesai = ({ handleNextStepData }) => {
  const videoRef = useRef(null);
  const [jamSelesai, setJamSelesai] = useState(null);
  const [fotoSelesai, setFotoSelesai] = useState(null);
  const [fotoDiambil, setFotoDiambil] = useState(false);
  const [isSelesaiSelected, setIsSelesaiSelected] = useState(false);
  const [koordinatSelesai, setKoordinatSelesai] = useState({ latitude: null, longitude: null });

  useEffect(() => {
    const startVideo = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => videoRef.current.play();
        } catch (error) {
          console.error("Error accessing the camera: ", error);
        }
      }
    };
    startVideo();
    return () => {
      const tracks = videoRef.current?.srcObject?.getTracks();
      tracks?.forEach(track => track.stop());
    };
  }, []);

  const handleSelesai = () => {
    if (!fotoDiambil) {
      const now = new Date();
      setJamSelesai(now);
      getLocation();
      capturePhoto();
      setIsSelesaiSelected(true);
      setFotoDiambil(true);
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      const fileSize = blob.size / (1024 * 1024);
      if (fileSize > 5) {
        const compressedBlob = await resizeImage(blob);
        setFotoSelesai(URL.createObjectURL(compressedBlob));
      } else {
        setFotoSelesai(URL.createObjectURL(blob));
      }
    }, 'image/png');
    stopVideoStream();
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
        canvas.toBlob((newBlob) => resolve(newBlob), 'image/png', 0.7);
      };
    });
  };

  const stopVideoStream = () => {
    const tracks = videoRef.current?.srcObject?.getTracks();
    tracks?.forEach(track => track.stop());
    videoRef.current.srcObject = null;
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setKoordinatSelesai({ latitude, longitude });
        },
        (error) => {
          alert('Unable to retrieve location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedJamSelesai = jamSelesai;
    const tanggalSelesai = formattedJamSelesai?.toLocaleDateString('en-GB');
    const jamSelesaiFormatted = formattedJamSelesai?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const submissionData = { fotoSelesai, tanggalSelesai, jamSelesai: jamSelesaiFormatted, koordinatSelesai: `${koordinatSelesai.latitude}, ${koordinatSelesai.longitude}` };
    handleNextStepData(submissionData);
    console.log("Form:", submissionData);
  };

  const handleUlangi = async () => {
    setJamSelesai(null);
    setIsSelesaiSelected(false);
    setFotoDiambil(false);
    setKoordinatSelesai({ latitude: null, longitude: null });
    setFotoSelesai(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => videoRef.current.play();
      } catch (error) {}
    }
  };

  const isFormValid = () => {
    return jamSelesai && koordinatSelesai.latitude && fotoSelesai;
  };

  return (
    <MobileLayout title="ABSENSI SELESAI" className="p-6 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
      <div style={styles.container}>
        <form style={styles.form}>
          {!fotoDiambil ? (
            <>
              <video ref={videoRef} style={styles.video} />
              <div style={styles.buttonContainer}>
                <button onClick={handleSelesai} style={styles.buttonActive}>SELESAI</button>
              </div>
            </>
          ) : (
            <div style={styles.details}>
              <img src={fotoSelesai} alt="Foto Selesai" style={styles.photo} />
              <div style={styles.infoContainer}>
                <div style={styles.infoBox}>
                  <p>Jam:</p>
                  <p>{jamSelesai?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div style={styles.infoBox}>
                  <p>Tanggal:</p>
                  <p>{jamSelesai?.toLocaleDateString('en-GB')}</p>
                </div>
                <div style={styles.infoBox}>
                  <p>Koordinat:</p>
                  <p>{koordinatSelesai.latitude}, {koordinatSelesai.longitude}</p>
                </div>
              </div>
              <div style={styles.formGroup}>
                <button onClick={handleUlangi} style={{ ...styles.buttonUlangi, color: '#000' }}>↻</button>
              </div>
              <div style={styles.formGroup}>
                <button type="submit" onClick={handleSubmit} disabled={!isFormValid()} style={isFormValid() ? styles.buttonActive : styles.buttonInactive}>➜</button>
              </div>
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
    borderRadius: '8px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '10px',
  },
  buttonActive: {
    width: '100%',
    padding: '10px',
    cursor: 'pointer',
    marginTop: '10px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    borderRadius: '10px',
    backgroundColor: '#28a745',
    border: '2px solid #000',
  },
  details: {
    textAlign: 'center',
  },
  photo: {
    width: '100%',
    borderRadius: '8px',
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
    borderRadius: '10px',
    cursor: 'not-allowed',
    backgroundColor: '#b0b0b0',
    border: '2px solid #000000',
  },
  buttonUlangi: {
    color: '#000',
    width: '100%',
    padding: '10px',
    cursor: 'pointer',
    marginTop: '10px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    borderRadius: '10px',
    backgroundColor: '#f44336',
    border: '2px solid #000000',
  },
};

export default StepSelesai;
